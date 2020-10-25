using System;
using Newtonsoft.Json;
// ReSharper disable IdentifierTypo

namespace ElencyConfig
{
    internal static class ValueRetrieval
    {
        public static bool? GetBoolean(string value, bool? fallback = null)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null && (value == "1" || value.ToLower() == "true"))
            {
                return true;
            }

            if (value != null && (value == "0" || value.ToLower() == "false"))
            {
                return false;
            }

            return fallback;
        }

        public static DateTime? GetDateTime(string value, DateTime? fallback = null)
        {
            switch (value)
            {
                case null when fallback.HasValue:
                    return fallback.Value;
                case null:
                    return null;
                default:
                    return DateTime.TryParse(value, out var parsedDateTime) ? parsedDateTime : fallback;
            }
        }

        public static int? GetInteger(string value, int? fallback = null)
        {
            switch (value)
            {
                case null when fallback.HasValue:
                    return fallback.Value;
                case null:
                    return null;
                default:
                    return int.TryParse(value, out var parsedInt) ? parsedInt : fallback;
            }
        }

        public static float? GetFloat(string value, float? fallback = null)
        {
            switch (value)
            {
                case null when fallback.HasValue:
                    return fallback.Value;
                case null:
                    return null;
                default:
                    return float.TryParse(value, out var parsedFloat) ? parsedFloat : fallback;
            }
        }

        public static decimal? GetDecimal(string value, decimal? fallback = null)
        {
            switch (value)
            {
                case null when fallback.HasValue:
                    return fallback.Value;
                case null:
                    return null;
                default:
                    return decimal.TryParse(value, out var parsedDecimal) ? parsedDecimal : fallback;
            }
        }

        public static double? GetDouble(string value, double? fallback = null)
        {
            switch (value)
            {
                case null when fallback.HasValue:
                    return fallback.Value;
                case null:
                    return null;
                default:
                    return double.TryParse(value, out var parsedDouble) ? parsedDouble : fallback;
            }
        }

        public static T GetObject<T>(string value) where T: class
        {
            return GetObject<T>(value, null);
        }

        public static T GetObject<T>(string value, T fallback) where T: class
        {
            if (value == null)
                return null;

            try
            {
                return JsonConvert.DeserializeObject<T>(value);
            }
            catch (Exception ex)
            {
                return fallback;
            }
        }
    }
}
