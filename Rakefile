# Rakefile
include Rake::DSL
require 'bundler'
Bundler.require

Wox::Tasks.create :info_plist => 'Odyssey/Odyssey-Info.plist', :sdk => 'iphoneos', :configuration => 'Release' do
  build :debug, :configuration => 'Debug'

  build :release, :developer_certificate => 'iPhone Distribution: Flexis ZAO' do
    ipa :adhoc, :provisioning_profile => 'BF741F28-33D8-45CD-935D-6A3D4AAF83C7' do
      testflight :publish, :api_token => 'af7140355be791bf7248083aab49f055_MTQzNzk0MjAxMS0wOC0zMSAwNjowMDoyMi40MzIzNjI',
                           :team_token => '6a9c504b1caccb323bc41e30053cb4bc_MTQ0MjU2MjAxMi0xMC0xNyAwMToxNDowMi41NDE4MTA',
                           :notes => proc { File.read("CHANGELOG") },
                           :distribution_lists => %w[Team],
                           :notify => true

    end
  end
end