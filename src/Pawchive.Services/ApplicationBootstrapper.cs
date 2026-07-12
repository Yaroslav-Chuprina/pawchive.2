using Microsoft.Extensions.Logging;
using Pawchive.Data.Abstractions;
using Pawchive.Plugins;
using Pawchive.Services.Abstractions;
using Pawchive.Storage.Abstractions;

namespace Pawchive.Services;

internal sealed class ApplicationBootstrapper : IApplicationBootstrapper
{
    private readonly IDatabaseInitializer _databaseInitializer;
    private readonly ILibraryStorage _libraryStorage;
    private readonly IPluginCatalog _pluginCatalog;
    private readonly ILogger<ApplicationBootstrapper> _logger;

    public ApplicationBootstrapper(
        IDatabaseInitializer databaseInitializer,
        ILibraryStorage libraryStorage,
        IPluginCatalog pluginCatalog,
        ILogger<ApplicationBootstrapper> logger)
    {
        _databaseInitializer = databaseInitializer;
        _libraryStorage = libraryStorage;
        _pluginCatalog = pluginCatalog;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting application bootstrap");
        await _databaseInitializer.InitializeAsync(cancellationToken).ConfigureAwait(false);
        await _libraryStorage.EnsureInitializedAsync(cancellationToken).ConfigureAwait(false);
        _pluginCatalog.Refresh();
        _logger.LogInformation("Application bootstrap completed");
    }
}
