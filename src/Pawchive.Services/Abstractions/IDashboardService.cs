namespace Pawchive.Services.Abstractions;

public interface IDashboardService
{
    Task<IReadOnlyCollection<DashboardMetric>> GetMetricsAsync(CancellationToken cancellationToken = default);
}
