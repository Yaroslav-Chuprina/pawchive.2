using Microsoft.Extensions.DependencyInjection;

namespace Pawchive.Plugins;

public static class PluginServiceCollectionExtensions
{
    public static IServiceCollection AddPawchivePlugins(this IServiceCollection services)
    {
        services.AddSingleton<IPluginCatalog, PluginCatalog>();
        return services;
    }
}
