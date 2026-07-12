using Pawchive.Core.Enums;

namespace Pawchive.Core.Entities;

public sealed record MediaItem(
    Guid Id,
    Guid PostId,
    MediaKind Kind,
    Uri SourceUri,
    string? FileName,
    string? LocalPath,
    long? SizeBytes,
    string? Sha256,
    DateTimeOffset CreatedAt);
