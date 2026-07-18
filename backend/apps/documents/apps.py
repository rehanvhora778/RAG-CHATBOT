from django.apps import AppConfig


class DocumentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.documents'
    label = 'documents'
    verbose_name = 'Documents'

    def ready(self):
        """Warm the embedding model in the background when an actual server
        process starts, so the first upload/chat never waits for model load.
        Skipped for management commands (migrate, shell, reprocess, ...)."""
        import os
        import sys

        from django.conf import settings

        if not getattr(settings, 'EMBEDDING_PRELOAD', True):
            return

        argv = ' '.join(sys.argv)
        if 'runserver' in argv:
            # With autoreload, ready() runs in both the watcher parent and the
            # worker child — only the child (RUN_MAIN=true) serves requests.
            if os.environ.get('RUN_MAIN') != 'true' and '--noreload' not in argv:
                return
        elif 'manage.py' in argv:
            return  # some other management command — no server here

        from services.embeddings import preload_embedding_model_async
        preload_embedding_model_async()
