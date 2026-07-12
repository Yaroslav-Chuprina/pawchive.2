using Microsoft.Data.Sqlite;

namespace Pawchive.Data.Abstractions;

public interface ISqliteConnectionFactory
{
    SqliteConnection CreateConnection();

    string DatabasePath { get; }
}
