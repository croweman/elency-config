using System.Text.RegularExpressions;
// ReSharper disable IdentifierTypo

namespace ElencyConfig.Validation
{
    internal static class VersionNumber
    {
        private static readonly Regex VersionNumberRegex = new Regex(@"^(\d+)\.(\d+).(\d+)$");

        public static bool IsValid(string versionNumber)
        {
            return !string.IsNullOrWhiteSpace(versionNumber) && VersionNumberRegex.IsMatch(versionNumber);
        }
    }
}
