from rest_framework import serializers
from django.conf import settings
from core.utils import get_file_extension


class DocumentUploadSerializer(serializers.Serializer):
    files = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=False,
        max_length=10,
    )

    def validate_files(self, files):
        errors = []
        max_bytes = settings.MAX_DOCUMENT_SIZE_MB * 1024 * 1024

        for f in files:
            ext = get_file_extension(f.name)
            if ext not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
                errors.append(f"{f.name}: unsupported type. Allowed: pdf, docx, txt.")
            elif f.size > max_bytes:
                errors.append(f"{f.name}: exceeds {settings.MAX_DOCUMENT_SIZE_MB}MB limit.")

        if errors:
            raise serializers.ValidationError(errors)
        return files


class DocumentSerializer(serializers.Serializer):
    id              = serializers.CharField()
    original_filename = serializers.CharField()
    file_type       = serializers.CharField()
    file_size       = serializers.IntegerField()
    status          = serializers.CharField()
    page_count      = serializers.IntegerField(default=0)
    word_count      = serializers.IntegerField(default=0)
    chunk_count     = serializers.IntegerField(default=0)
    summary         = serializers.CharField(default='', allow_blank=True)
    error_message   = serializers.CharField(default='', allow_blank=True)
    created_at      = serializers.DateTimeField()
    updated_at      = serializers.DateTimeField()
