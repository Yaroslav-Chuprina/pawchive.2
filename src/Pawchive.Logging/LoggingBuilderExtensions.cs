using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Pawchive.Configuration;

namespace Pawchive.Logging;

public static class LoggingBuilderExtensions
{
    public static ILoggingBuilder AddPawchiveFile(this ILoggingBuilder builder, LoggingSettings settings)
    {
        var options = new FileLoggerOptions
        {
            DirectoryPath = ResolvePath(settings.DirectoryPath),
            FileName = settings.FileName,
            MinimumLevel = settings.MinimumLevel
        };

        builder.Services.AddSingleton<ILoggerProvider>(_ => new FileLoggerProvider(options));
        return builder;
    }

    private static string ResolvePath(string path)
    {
        if (Path.IsPathRooted(path))
        {
            return path;
        }

        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        return Path.Combine(appData, "Pawchive", path.Replace('/', Path.DirectorySeparatorChar));
    }
}
