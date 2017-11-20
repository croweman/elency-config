using System;
using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;

namespace ElencyConfig
{
    internal static class ValueRetrieval
    {

        public static bool? GetBoolean(string value)
        {
            return GetBoolean(value, null);
        }

        public static bool? GetBoolean(string value, bool? fallback)
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

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static DateTime? GetDateTime(string value)
        {
            return GetDateTime(value, null);
        }

        public static DateTime? GetDateTime(string value, DateTime? fallback)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null)
            {
                DateTime parsedDateTime;
                if (DateTime.TryParse(value, out parsedDateTime))
                {
                    return parsedDateTime;
                }
            }

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static int? GetInteger(string value)
        {
            return GetInteger(value, null);
        }

        public static int? GetInteger(string value, int? fallback)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null)
            {
                int parsedInt;
                if (int.TryParse(value, out parsedInt))
                {
                    return parsedInt;
                }
            }

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static float? GetFloat(string value)
        {
            return GetFloat(value, null);
        }

        public static float? GetFloat(string value, float? fallback)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null)
            {
                float parsedFloat;
                if (float.TryParse(value, out parsedFloat))
                {
                    return parsedFloat;
                }
            }

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static decimal? GetDecimal(string value)
        {
            return GetDecimal(value, null);
        }

        public static decimal? GetDecimal(string value, decimal? fallback)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null)
            {
                decimal parsedDecimal;
                if (decimal.TryParse(value, out parsedDecimal))
                {
                    return parsedDecimal;
                }
            }

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static double? GetDouble(string value)
        {
            return GetDouble(value, null);
        }

        public static double? GetDouble(string value, double? fallback)
        {
            if (value == null && fallback.HasValue)
            {
                return fallback.Value;
            }

            if (value != null)
            {
                double parsedDouble;
                if (double.TryParse(value, out parsedDouble))
                {
                    return parsedDouble;
                }
            }

            if (fallback.HasValue)
            {
                return fallback.Value;
            }

            return null;
        }

        public static T GetObject<T>(string value) where T: class
        {
            return GetObject<T>(value, null);
        }

        public static T GetObject<T>(string value, T fallback) where T: class
        {
            if (value == null)
            {
                return null;
            }

            try
            {
                using (var memoryStream = new MemoryStream(Encoding.UTF8.GetBytes(value)))
                {
                    var serializer = new DataContractJsonSerializer(typeof(T));
                    return serializer.ReadObject(memoryStream) as T;
                }
            }
            catch (Exception ex)
            {
                return fallback;
            }
        }
    }
}
