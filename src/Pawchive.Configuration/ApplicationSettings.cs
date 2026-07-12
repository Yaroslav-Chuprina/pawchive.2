using Microsoft.Extensions.Logging;

namespace Pawchive.Configuration;

public sealed class ApplicationSettings
{
    public const string SectionName = "Pawchive";

    public DatabaseSettings Database { get; init; } = new();

    public StorageSettings Storage { get; init; } = new();

    public LoggingSettings Logging { get; init; } = new();
}

public sealed class DatabaseSettings
{
    public string Path { get; init; } = "data/pawchive.db";
}

public sealed class StorageSettings
{
    public string LibraryRoot { get; init; } = "library";
}

public sealed class LoggingSettings
{
    public string DirectoryPath { get; init; } = "logs";

    public string FileName { get; init; } = "pawchive.log";

    public LogLevel MinimumLevel { get; init; } = LogLevel.Information;
}
