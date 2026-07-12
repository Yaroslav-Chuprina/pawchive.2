using Pawchive.Core.Enums;

namespace Pawchive.Core.Entities;

public sealed record Post(
    Guid Id,
    Guid AuthorId,
    string ExternalId,
    string Title,
    string? Body,
    Uri SourceUri,
    PostStatus Status,
    DateTimeOffset PublishedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
