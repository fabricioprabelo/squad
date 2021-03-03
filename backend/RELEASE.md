# RELEASE

## <a name="monitor-the-app"></a>Monitorar o aplicativo

É possível usar o _systemd_ para criar um arquivo de serviço para iniciar e monitorar o aplicativo Web subjacente. _systemd_ é um sistema de inicialização que fornece muitos recursos poderosos para iniciar, parar e gerenciar processos.

### <a name="create-the-service-file"></a>Criar o arquivo de serviço

Crie o arquivo de definição de serviço:

```bash
sudo vim /etc/systemd/system/app-server.service
```

A seguir, um exemplo de arquivo de serviço para o aplicativo:

```ini
[Unit]
Description=Application Server

[Service]
WorkingDirectory=/app/path
ExecStart=/usr/bin/yarn start
Restart=always
# Restart service after 10 seconds if the dotnet service crashes:
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=app-server
User=app-user
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

No exemplo anterior, o usuário que gerencia o serviço é especificado pela `User` opção. O usuário ( `app-user` ) deve existir e ter a propriedade adequada dos arquivos do aplicativo.

Use `TimeoutStopSec` para configurar a duração do tempo de espera para o aplicativo desligar depois de receber o sinal de interrupção inicial. Se o aplicativo não desligar nesse período, o SIGKILL será emitido para encerrá-lo. Forneça o valor como segundos sem unidade (por exemplo, `150`), um valor de duração (por exemplo, `2min 30s`) ou `infinity` para desabilitar o tempo limite. `TimeoutStopSec` é revertido para o valor padrão de `DefaultTimeoutStopSec` no arquivo de configuração do gerenciador (_systemd-system.conf_, _system.conf.d_, _systemd-user.conf_ e _user.conf.d_). O tempo limite padrão para a maioria das distribuições é de 90 segundos.

```
# The default value is 90 seconds for most distributions.
TimeoutStopSec=90
```
