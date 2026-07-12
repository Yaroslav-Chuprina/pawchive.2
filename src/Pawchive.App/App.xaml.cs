using System.Windows;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Pawchive.App.ViewModels;
using Pawchive.Configuration;
using Pawchive.Data;
using Pawchive.Logging;
using Pawchive.Plugins;
using Pawchive.Services;
using Pawchive.Services.Abstractions;
using Pawchive.Shared;
using Pawchive.Storage;

namespace Pawchive.App;

public partial class App : Application
{
    private IHost? _host;

    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        try
        {
            _host = CreateHostBuilder(e.Args).Build();
            await _host.StartAsync().ConfigureAwait(true);

            await _host.Services
                .GetRequiredService<IApplicationBootstrapper>()
                .InitializeAsync()
                .ConfigureAwait(true);

            await _host.Services
                .GetRequiredService<MainWindowViewModel>()
                .LoadAsync()
                .ConfigureAwait(true);

            MainWindow = _host.Services.GetRequiredService<MainWindow>();
            MainWindow.Show();
        }
        catch (Exception exception)
        {
            MessageBox.Show(
                exception.Message,
                "Pawchive startup failed",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Shutdown(-1);
        }
    }

    protected override async void OnExit(ExitEventArgs e)
    {
        if (_host is not null)
        {
            await _host.StopAsync(TimeSpan.FromSeconds(5)).ConfigureAwait(true);
            _host.Dispose();
        }

        base.OnExit(e);
    }

    private static IHostBuilder CreateHostBuilder(string[] args)
    {
        return Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration(static (_, configuration) =>
            {
                configuration.SetBasePath(AppContext.BaseDirectory);
                configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            })
            .ConfigureLogging(static (context, logging) =>
            {
                var settings = context.Configuration
                    .GetSection(ApplicationSettings.SectionName)
                    .Get<ApplicationSettings>() ?? new ApplicationSettings();

                logging.ClearProviders();
                logging.SetMinimumLevel(settings.Logging.MinimumLevel);
                logging.AddConsole();
                logging.AddPawchiveFile(settings.Logging);
            })
            .ConfigureServices(static (context, services) =>
            {
                services.AddSingleton<IClock, SystemClock>();
                services.AddPawchiveConfiguration(context.Configuration);
                services.AddPawchiveData();
                services.AddPawchiveStorage();
                services.AddPawchivePlugins();
                services.AddPawchiveServices();
                services.AddSingleton<MainWindowViewModel>();
                services.AddSingleton<MainWindow>();
            });
    }
}
