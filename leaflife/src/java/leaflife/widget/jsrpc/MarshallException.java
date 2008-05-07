package leaflife.widget.jsrpc;

/**
 * Thrown by serializer objects when they are unable to marshall the java objects into JSON string.
 */
public class MarshallException extends RPCException
{
    private static final long serialVersionUID = -458268526786511794L;

    public MarshallException(String code)
    {
        super(code);
    }
}
