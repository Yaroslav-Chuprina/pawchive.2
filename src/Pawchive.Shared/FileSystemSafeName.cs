namespace Pawchive.Shared;

public static class FileSystemSafeName
{
    private const int MaxLength = 120;

    public static string Create(string value, string fallback = "untitled")
    {
        var source = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
        var invalidCharacters = Path.GetInvalidFileNameChars();
        var safeCharacters = source
            .Select(character => invalidCharacters.Contains(character) ? '_' : character)
            .ToArray();

        var safeName = new string(safeCharacters).Trim('.', ' ');

        if (string.IsNullOrWhiteSpace(safeName))
        {
            safeName = fallback;
        }

        return safeName.Length <= MaxLength ? safeName : safeName[..MaxLength].Trim();
    }
}
