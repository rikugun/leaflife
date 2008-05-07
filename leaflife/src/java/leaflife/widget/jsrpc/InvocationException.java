package leaflife.widget.jsrpc;

/**
 * Thrown by JS-RPC service or serializer when class instantiating or method calling failed.
 * @author huangchao
 */
public class InvocationException extends RPCException
{
    private static final long serialVersionUID = -2458213789226515520L;

    public InvocationException(String code)
    {
        super(code);
    }
}
