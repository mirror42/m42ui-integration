require 'openssl'
require 'digest/md5'
require 'digest/sha1'

class Mirror42Encryption

  class << self

    # Computes a token that should be appended to the URL send to Mirror42
    # when requesting a Mirror42 page.
    def token(user)
      time = Time.now.to_i * 1000
      home_url + "#" + user.email + ":" + time.to_s + ":" + sha(user.email, time) + ':' + algorithm
    end

    def consumer_secret
      config[:consumer_secret]
    end

    def home_url
      config[:home_url]
    end

    def algorithm
      config[:algorithm] || :sha1
    end

    private

      def config
        @config ||= YAML.load_file(File.join(Rails.root.to_s, 'config', 'mirror42.yml'))[Rails.env.to_s].with_indifferent_access
      end

      def sha(email, time)
        digest_sha(algorithm).digest("#{email}#{time}#{consumer_secret}").unpack("H*")[0]
      end

      def digest_sha(algorithm)
        algorithm ||= :sha1
        case algorithm.to_sym
        when :sha256 then OpenSSL::Digest::SHA256
        when :sha384 then OpenSSL::Digest::SHA384
        when :sha512 then OpenSSL::Digest::SHA512
        else
          OpenSSL::Digest::SHA1
        end
      end

  end

end