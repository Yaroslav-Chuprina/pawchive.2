namespace Pawchive.Storage.Abstractions;

public interface ILibraryStorage
{
    string RootPath { get; }

    Task EnsureInitializedAsync(CancellationToken cancellationToken = default);

    string GetAuthorRoot(string authorDisplayName);
}
