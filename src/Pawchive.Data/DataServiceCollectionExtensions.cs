using Microsoft.Extensions.DependencyInjection;
using Pawchive.Data.Abstractions;
using Pawchive.Data.Sqlite;

namespace Pawchive.Data;

public static class DataServiceCollectionExtensions
{
    public static IServiceCollection AddPawchiveData(this IServiceCollection services)
    {
        services.AddSingleton<ISqliteConnectionFactory, SqliteConnectionFactory>();
        services.AddSingleton<IDatabaseInitializer, SqliteDatabaseInitializer>();
        return services;
    }
}
