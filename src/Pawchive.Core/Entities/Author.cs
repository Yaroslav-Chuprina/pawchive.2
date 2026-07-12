namespace Pawchive.Core.Entities;

public sealed record Author(
    Guid Id,
    string DisplayName,
    string SourceUrl,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastSyncedAt);
