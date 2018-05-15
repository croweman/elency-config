class VersionNumber

  def isValid(versionNumber)
    if (versionNumber =~ /^(\d+)\.(\d+).(\d+)$/)
       return true
    end

    return false
  end

end