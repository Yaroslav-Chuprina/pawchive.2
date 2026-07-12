using Microsoft.Extensions.DependencyInjection;
using Pawchive.Storage.Abstractions;

namespace Pawchive.Storage;

public static class StorageServiceCollectionExtensions
{
    public static IServiceCollection AddPawchiveStorage(this IServiceCollection services)
    {
        services.AddSingleton<ILibraryStorage, LibraryStorage>();
        return services;
    }
}
