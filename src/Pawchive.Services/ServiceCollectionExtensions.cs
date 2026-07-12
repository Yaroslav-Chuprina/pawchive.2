using Microsoft.Extensions.DependencyInjection;
using Pawchive.Services.Abstractions;

namespace Pawchive.Services;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPawchiveServices(this IServiceCollection services)
    {
        services.AddSingleton<IApplicationBootstrapper, ApplicationBootstrapper>();
        services.AddSingleton<IDashboardService, DashboardService>();
        return services;
    }
}
