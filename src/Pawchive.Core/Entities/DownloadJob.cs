using Pawchive.Core.Enums;

namespace Pawchive.Core.Entities;

public sealed record DownloadJob(
    Guid Id,
    Guid? MediaItemId,
    Uri SourceUri,
    string DestinationPath,
    DownloadStatus Status,
    long? ExpectedBytes,
    long ReceivedBytes,
    int AttemptCount,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
