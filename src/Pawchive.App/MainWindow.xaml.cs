using System.Windows;
using Pawchive.App.ViewModels;

namespace Pawchive.App;

public partial class MainWindow : Window
{
    public MainWindow(MainWindowViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
    }
}
