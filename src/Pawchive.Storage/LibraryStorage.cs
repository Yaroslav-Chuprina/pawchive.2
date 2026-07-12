using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Pawchive.Configuration;
using Pawchive.Shared;
using Pawchive.Storage.Abstractions;

namespace Pawchive.Storage;

internal sealed class LibraryStorage : ILibraryStorage
{
    private readonly ILogger<LibraryStorage> _logger;

    public LibraryStorage(
        IOptions<ApplicationSettings> settings,
        ILogger<LibraryStorage> logger)
    {
        _logger = logger;
        RootPath = ResolveRoot(settings.Value.Storage.LibraryRoot);
    }

    public string RootPath { get; }

    public Task EnsureInitializedAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        Directory.CreateDirectory(RootPath);
        _logger.LogInformation("Library storage initialized at {RootPath}", RootPath);
        return Task.CompletedTask;
    }

    public string GetAuthorRoot(string authorDisplayName)
    {
        return Path.Combine(RootPath, FileSystemSafeName.Create(authorDisplayName, "author"));
    }

    private static string ResolveRoot(string configuredRoot)
    {
        var root = string.IsNullOrWhiteSpace(configuredRoot) ? "library" : configuredRoot;

        if (Path.IsPathRooted(root))
        {
            return root;
        }

        var appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        return Path.Combine(appData, "Pawchive", root.Replace('/', Path.DirectorySeparatorChar));
    }
}
