using Pawchive.Plugins;
using Pawchive.Services.Abstractions;
using Pawchive.Storage.Abstractions;

namespace Pawchive.Services;

internal sealed class DashboardService : IDashboardService
{
    private readonly ILibraryStorage _libraryStorage;
    private readonly IPluginCatalog _pluginCatalog;

    public DashboardService(
        ILibraryStorage libraryStorage,
        IPluginCatalog pluginCatalog)
    {
        _libraryStorage = libraryStorage;
        _pluginCatalog = pluginCatalog;
    }

    public Task<IReadOnlyCollection<DashboardMetric>> GetMetricsAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IReadOnlyCollection<DashboardMetric> metrics =
        [
            new("Authors", "0", "Ready for indexing"),
            new("Posts", "0", "Database initialized"),
            new("Downloads", "0", "Queue idle"),
            new("Sources", _pluginCatalog.Sources.Count.ToString(), _libraryStorage.RootPath)
        ];

        return Task.FromResult(metrics);
    }
}
