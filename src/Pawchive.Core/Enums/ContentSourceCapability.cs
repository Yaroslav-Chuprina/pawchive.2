namespace Pawchive.Core.Enums;

[Flags]
public enum ContentSourceCapability
{
    None = 0,
    Posts = 1,
    Media = 2,
    IncrementalSync = 4,
    Comments = 8
}
