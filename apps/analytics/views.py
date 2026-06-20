import logging
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.mongo import analytics_col, documents_col, chat_sessions_col, messages_col
from core.responses import APIResponse
from core.constants import EVENT_UPLOAD, EVENT_QUERY, EVENT_EXPORT, EVENT_SUMMARY

logger = logging.getLogger(__name__)


class UserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return aggregated analytics for the authenticated user."""
        uid = request.user.id
        now = timezone.now()
        last_30 = now - timedelta(days=30)
        last_7  = now - timedelta(days=7)

        # Document stats
        total_docs     = documents_col().count_documents({'user_id': uid})
        completed_docs = documents_col().count_documents({'user_id': uid, 'status': 'completed'})
        failed_docs    = documents_col().count_documents({'user_id': uid, 'status': 'failed'})
        docs_this_week = documents_col().count_documents({'user_id': uid, 'created_at': {'$gte': last_7}})

        # Chat stats
        total_sessions = chat_sessions_col().count_documents({'user_id': uid})
        active_sessions = chat_sessions_col().count_documents({'user_id': uid, 'status': 'active'})
        total_messages  = messages_col().count_documents({'user_id': uid})
        user_messages   = messages_col().count_documents({'user_id': uid, 'role': 'user'})
        messages_this_week = messages_col().count_documents({'user_id': uid, 'created_at': {'$gte': last_7}})

        # Analytics events
        uploads_30d = analytics_col().count_documents({'user_id': uid, 'event_type': EVENT_UPLOAD, 'created_at': {'$gte': last_30}})
        queries_30d = analytics_col().count_documents({'user_id': uid, 'event_type': EVENT_QUERY,  'created_at': {'$gte': last_30}})
        exports_30d = analytics_col().count_documents({'user_id': uid, 'event_type': EVENT_EXPORT, 'created_at': {'$gte': last_30}})

        # Daily query trend (last 7 days)
        daily_trend = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end   = day_start + timedelta(days=1)
            count = analytics_col().count_documents({
                'user_id':    uid,
                'event_type': EVENT_QUERY,
                'created_at': {'$gte': day_start, '$lt': day_end},
            })
            daily_trend.append({
                'date':  day_start.strftime('%Y-%m-%d'),
                'queries': count,
            })

        # Document type breakdown
        type_pipeline = [
            {'$match': {'user_id': uid}},
            {'$group': {'_id': '$file_type', 'count': {'$sum': 1}}},
        ]
        type_breakdown = {r['_id']: r['count'] for r in documents_col().aggregate(type_pipeline)}

        return APIResponse.success(data={
            'documents': {
                'total':      total_docs,
                'completed':  completed_docs,
                'failed':     failed_docs,
                'this_week':  docs_this_week,
                'by_type':    type_breakdown,
            },
            'chat': {
                'total_sessions':    total_sessions,
                'active_sessions':   active_sessions,
                'total_messages':    total_messages,
                'user_queries':      user_messages,
                'messages_this_week': messages_this_week,
            },
            'activity': {
                'uploads_last_30d':  uploads_30d,
                'queries_last_30d':  queries_30d,
                'exports_last_30d':  exports_30d,
            },
            'daily_query_trend': daily_trend,
        })


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Summary data for the user dashboard."""
        uid = request.user.id

        recent_docs = list(
            documents_col()
            .find({'user_id': uid})
            .sort('created_at', -1)
            .limit(5)
        )
        recent_sessions = list(
            chat_sessions_col()
            .find({'user_id': uid})
            .sort('last_message_at', -1)
            .limit(5)
        )

        from core.utils import serialize_mongo_doc, format_file_size

        def ser_doc(d):
            r = serialize_mongo_doc(d)
            r['id'] = r.pop('_id', '')
            r['file_size_display'] = format_file_size(r.get('file_size', 0))
            return r

        def ser_session(s):
            r = serialize_mongo_doc(s)
            r['id'] = r.pop('_id', '')
            return r

        total_docs     = documents_col().count_documents({'user_id': uid})
        total_sessions = chat_sessions_col().count_documents({'user_id': uid})
        total_queries  = messages_col().count_documents({'user_id': uid, 'role': 'user'})

        return APIResponse.success(data={
            'stats': {
                'total_documents': total_docs,
                'total_sessions':  total_sessions,
                'total_queries':   total_queries,
            },
            'recent_documents': [ser_doc(d) for d in recent_docs],
            'recent_sessions':  [ser_session(s) for s in recent_sessions],
        })
