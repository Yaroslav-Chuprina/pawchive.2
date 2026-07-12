using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Pawchive.Logging;

public sealed class FileLoggerProvider : ILoggerProvider
{
    private readonly ConcurrentDictionary<string, FileLogger> _loggers = new(StringComparer.OrdinalIgnoreCase);
    private readonly object _gate = new();
    private readonly FileLoggerOptions _options;

    public FileLoggerProvider(FileLoggerOptions options)
    {
        _options = options;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return _loggers.GetOrAdd(categoryName, name => new FileLogger(name, _options, _gate));
    }

    public void Dispose()
    {
        _loggers.Clear();
    }
}
