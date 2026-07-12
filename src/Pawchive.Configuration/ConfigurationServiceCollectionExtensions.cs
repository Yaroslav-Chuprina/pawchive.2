using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Pawchive.Configuration;

public static class ConfigurationServiceCollectionExtensions
{
    public static IServiceCollection AddPawchiveConfiguration(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<ApplicationSettings>(configuration.GetSection(ApplicationSettings.SectionName));
        return services;
    }
}
