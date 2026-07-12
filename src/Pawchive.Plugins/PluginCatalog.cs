using Microsoft.Extensions.Logging;

namespace Pawchive.Plugins;

internal sealed class PluginCatalog : IPluginCatalog
{
    private readonly IEnumerable<IContentSourcePlugin> _plugins;
    private readonly ILogger<PluginCatalog> _logger;
    private IReadOnlyCollection<ContentSourceDescriptor> _sources = Array.Empty<ContentSourceDescriptor>();

    public PluginCatalog(
        IEnumerable<IContentSourcePlugin> plugins,
        ILogger<PluginCatalog> logger)
    {
        _plugins = plugins;
        _logger = logger;
    }

    public IReadOnlyCollection<ContentSourceDescriptor> Sources => _sources;

    public void Refresh()
    {
        _sources = _plugins.Select(plugin => plugin.Descriptor).ToArray();
        _logger.LogInformation("Plugin catalog refreshed with {PluginCount} content source(s)", _sources.Count);
    }
}
