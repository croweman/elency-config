using System.Text.RegularExpressions;

namespace ElencyConfig.Validation
{
    internal static class VersionNumber
    {
        private static Regex _versionNumberRegex = new Regex(@"^(\d+)\.(\d+).(\d+)$");

        public static bool IsValid(string versionNumber)
        {
            if (string.IsNullOrWhiteSpace(versionNumber))
            {
                return false;
            }

            return _versionNumberRegex.IsMatch(versionNumber);
        }
    }
}
