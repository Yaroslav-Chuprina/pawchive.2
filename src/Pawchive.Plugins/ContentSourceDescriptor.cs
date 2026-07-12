using Pawchive.Core.Enums;

namespace Pawchive.Plugins;

public sealed record ContentSourceDescriptor(
    string Id,
    string DisplayName,
    Version Version,
    ContentSourceCapability Capabilities);
