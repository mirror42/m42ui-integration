public class Mirror42Encryption {

    public String getHomeURL() {
        return 'https://my-domain.mirror42.com';
    }

    public String getConsumerSecret() {
        return 'my-consumer-secret';
    }

    /**
     * Creates a token that serves as the input into the client-side
     * function Mirror42.show.
     *
     * Example:
     *
     *   var token = new Mirror42Encryption().getToken('user@example.com');
     *
     */
    public String getToken(email) {
        String homeURL = getHomeURL();
        String key = getConsumerSecret();
        Long time = System.currentTimeMillis();
        String sha1 = getHash(email + time + key);
        return homeURL + '#' + email + ':' + time + ':' + sha1 + ':sha1';
    }

    private String getHash(String msg) {
        Blob data = Crypto.generateDigest('SHA1', Blob.valueOf(msg));
        String hexDigest = EncodingUtil.convertToHex(data);
        return hexDigest;
    }

}