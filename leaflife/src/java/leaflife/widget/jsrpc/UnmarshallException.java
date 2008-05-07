package leaflife.widget.jsrpc;

/**
 * Thrown by serializer objects when they are unable to unmarshall the JSON string into specified java objects.
 */
public class UnmarshallException extends RPCException
{
    private static final long serialVersionUID = -1049209394363771477L;

    public UnmarshallException(String code)
    {
        super(code);
    }
}
