using Microsoft.Extensions.Logging;
using Pawchive.Data.Abstractions;

namespace Pawchive.Data.Sqlite;

internal sealed class SqliteDatabaseInitializer : IDatabaseInitializer
{
    private readonly ISqliteConnectionFactory _connectionFactory;
    private readonly ILogger<SqliteDatabaseInitializer> _logger;

    public SqliteDatabaseInitializer(
        ISqliteConnectionFactory connectionFactory,
        ILogger<SqliteDatabaseInitializer> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

        using var command = connection.CreateCommand();
        command.CommandText = SchemaSql;
        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);

        _logger.LogInformation("SQLite database initialized at {DatabasePath}", _connectionFactory.DatabasePath);
    }

    private const string SchemaSql = """
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS schema_migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS authors (
            id TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            source_url TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            last_synced_at TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            author_id TEXT NOT NULL,
            external_id TEXT NOT NULL,
            title TEXT NOT NULL,
            body TEXT NULL,
            source_url TEXT NOT NULL,
            status TEXT NOT NULL,
            published_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(author_id, external_id),
            FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS media_items (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL,
            kind TEXT NOT NULL,
            source_url TEXT NOT NULL,
            file_name TEXT NULL,
            local_path TEXT NULL,
            size_bytes INTEGER NULL,
            sha256 TEXT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS download_jobs (
            id TEXT PRIMARY KEY,
            media_item_id TEXT NULL,
            source_url TEXT NOT NULL,
            destination_path TEXT NOT NULL,
            status TEXT NOT NULL,
            expected_bytes INTEGER NULL,
            received_bytes INTEGER NOT NULL DEFAULT 0,
            attempt_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(media_item_id) REFERENCES media_items(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS application_state (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        INSERT OR IGNORE INTO schema_migrations(name) VALUES ('0001_initial_schema');
        """;
}
