namespace Pawchive.Plugins;

public interface IPluginCatalog
{
    IReadOnlyCollection<ContentSourceDescriptor> Sources { get; }

    void Refresh();
}
