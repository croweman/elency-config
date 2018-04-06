using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ElencyConfig
{
    public interface IElencyConfigClient
    {
        string AppVersion { get; }
        string ConfigurationId { get; }
        string Environment { get; }

        string Get(string key);
        List<string> GetAllKeys();
        bool? GetBoolean(string key);
        bool? GetBoolean(string key, bool? fallback);
        DateTime? GetDateTime(string key);
        DateTime? GetDateTime(string key, DateTime? fallback);
        decimal? GetDecimal(string key);
        decimal? GetDecimal(string key, decimal? fallback);
        double? GetDouble(string key);
        double? GetDouble(string key, double? fallback);
        float? GetFloat(string key);
        float? GetFloat(string key, float? fallback);
        int? GetInteger(string key);
        int? GetInteger(string key, int? fallback);
        T GetObject<T>(string key) where T : class;
        T GetObject<T>(string key, T fallback) where T : class;
        Task Init(ElencyConfiguration config);
        Task Refresh();
        void Reset();
    }
}