namespace Pawchive.Shared;

public readonly record struct Result(bool Succeeded, string? ErrorMessage = null)
{
    public static Result Success() => new(true);

    public static Result Failure(string errorMessage)
    {
        return new(false, string.IsNullOrWhiteSpace(errorMessage) ? "Unknown error." : errorMessage);
    }
}
