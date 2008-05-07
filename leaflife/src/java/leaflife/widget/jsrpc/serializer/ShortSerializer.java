package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Short object and JSON string.
 * @author huangchao
 */
public class ShortSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {short.class, Short.class};

    public Class[] getSerializableClasses()
    {
        return serializable_classes;
    }

    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException
    {
        try
        {
            if (json.nextToken() == Tokener.CHARACTERS)
            {
                if (json.isNumber())
                {
                    return new Short(json.getTokenText());
                }
                else if (json.isBooleanTrue())
                {
                    return new Short((short) 1);
                }
                else if (json.isBooleanFalse())
                {
                    return new Short((short) 0);
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("212");  // can not convert JSON string to short object
    }
}
