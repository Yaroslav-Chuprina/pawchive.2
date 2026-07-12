using System.Collections.ObjectModel;
using Pawchive.Services.Abstractions;

namespace Pawchive.App.ViewModels;

public sealed class MainWindowViewModel : ViewModelBase
{
    private readonly IDashboardService _dashboardService;
    private string _statusMessage = "Starting";

    public MainWindowViewModel(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    public string WindowTitle => "Pawchive Downloader";

    public ObservableCollection<DashboardMetricViewModel> Metrics { get; } = new();

    public string StatusMessage
    {
        get => _statusMessage;
        private set => SetProperty(ref _statusMessage, value);
    }

    public async Task LoadAsync(CancellationToken cancellationToken = default)
    {
        StatusMessage = "Loading dashboard";
        var metrics = await _dashboardService.GetMetricsAsync(cancellationToken).ConfigureAwait(true);

        Metrics.Clear();
        foreach (var metric in metrics)
        {
            Metrics.Add(new DashboardMetricViewModel(metric.Label, metric.Value, metric.Detail));
        }

        StatusMessage = "Ready";
    }
}
