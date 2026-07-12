namespace Pawchive.Shared;

public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
