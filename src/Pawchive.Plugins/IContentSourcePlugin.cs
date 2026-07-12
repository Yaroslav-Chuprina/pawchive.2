namespace Pawchive.Plugins;

public interface IContentSourcePlugin
{
    ContentSourceDescriptor Descriptor { get; }

    bool CanHandle(Uri sourceUri);
}
