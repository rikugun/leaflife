package leaflife.widget.jsrpc;

/**
 * Thrown by serializer objects when the syntax of JSON string is invalid.
 */
public class InvalidJSONSyntaxException extends RPCException
{
    private static final long serialVersionUID = -458268526786511794L;

    public InvalidJSONSyntaxException(String code)
    {
        super(code);
    }
}
