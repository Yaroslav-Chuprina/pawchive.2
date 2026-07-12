using Microsoft.Extensions.Logging;

namespace Pawchive.Logging;

public sealed class FileLoggerOptions
{
    public string DirectoryPath { get; init; } = "logs";

    public string FileName { get; init; } = "pawchive.log";

    public LogLevel MinimumLevel { get; init; } = LogLevel.Information;

    public string FilePath => Path.Combine(DirectoryPath, FileName);
}
