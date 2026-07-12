using Microsoft.Extensions.Logging;

namespace Pawchive.Logging;

internal sealed class FileLogger : ILogger
{
    private readonly string _categoryName;
    private readonly FileLoggerOptions _options;
    private readonly object _gate;

    public FileLogger(string categoryName, FileLoggerOptions options, object gate)
    {
        _categoryName = categoryName;
        _options = options;
        _gate = gate;
    }

    public IDisposable? BeginScope<TState>(TState state)
        where TState : notnull
    {
        return NullScope.Instance;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logLevel != LogLevel.None && logLevel >= _options.MinimumLevel;
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var message = formatter(state, exception);
        if (string.IsNullOrWhiteSpace(message) && exception is null)
        {
            return;
        }

        var line = BuildLine(logLevel, eventId, message, exception);

        lock (_gate)
        {
            Directory.CreateDirectory(_options.DirectoryPath);
            File.AppendAllText(_options.FilePath, line + Environment.NewLine);
        }
    }

    private string BuildLine(LogLevel logLevel, EventId eventId, string message, Exception? exception)
    {
        var eventPart = eventId.Id == 0 ? string.Empty : $" [{eventId.Id}:{eventId.Name}]";
        var exceptionPart = exception is null ? string.Empty : $" {exception}";
        return $"{DateTimeOffset.UtcNow:O} [{logLevel}] {_categoryName}{eventPart}: {message}{exceptionPart}";
    }

    private sealed class NullScope : IDisposable
    {
        public static readonly NullScope Instance = new();

        public void Dispose()
        {
        }
    }
}
