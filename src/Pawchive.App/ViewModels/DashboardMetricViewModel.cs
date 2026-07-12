namespace Pawchive.App.ViewModels;

public sealed class DashboardMetricViewModel
{
    public DashboardMetricViewModel(string label, string value, string detail)
    {
        Label = label;
        Value = value;
        Detail = detail;
    }

    public string Label { get; }

    public string Value { get; }

    public string Detail { get; }
}
