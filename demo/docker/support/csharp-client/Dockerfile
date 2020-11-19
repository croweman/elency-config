FROM mcr.microsoft.com/dotnet/core/aspnet:3.1.9-alpine3.12

COPY --chown=nobody:nobody ./bin/Release/netcoreapp3.1/publish /build

USER nobody

WORKDIR /build

EXPOSE 9000

CMD ["dotnet", "Client.dll"]