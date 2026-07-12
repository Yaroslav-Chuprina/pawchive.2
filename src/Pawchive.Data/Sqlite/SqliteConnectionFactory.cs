using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pawchive.Configuration;
using Pawchive.Data.Abstractions;

namespace Pawchive.Data.Sqlite;

internal sealed class SqliteConnectionFactory : ISqliteConnectionFactory
{
    private readonly ILogger<SqliteConnectionFactory> _logger;

    public SqliteConnectionFactory(
        IOptions<ApplicationSettings> settings,
        ILogger<SqliteConnectionFactory> logger)
    {
        _logger = logger;
        DatabasePath = ResolveDatabasePath(settings.Value.Database.Path);
    }

    public string DatabasePath { get; }

    public SqliteConnection CreateConnection()
    {
        var directory = Path.GetDirectoryName(DatabasePath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = DatabasePath,
            ForeignKeys = true
        }.ToString();

        _logger.LogDebug("Opening SQLite database at {DatabasePath}", DatabasePath);
        return new SqliteConnection(connectionString);
    }

    private static string ResolveDatabasePath(string configuredPath)
    {
        var path = string.IsNullOrWhiteSpace(configuredPath) ? "data/pawchive.db" : configuredPath;

        if (Path.IsPathRooted(path))
        {
            return path;
        }

        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        return Path.Combine(appData, "Pawchive", path.Replace('/', Path.DirectorySeparatorChar));
    }
}
