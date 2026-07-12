namespace Pawchive.Services.Abstractions;

public interface IApplicationBootstrapper
{
    Task InitializeAsync(CancellationToken cancellationToken = default);
}
