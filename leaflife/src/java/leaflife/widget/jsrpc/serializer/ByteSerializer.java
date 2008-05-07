package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Byte object and JSON string.
 * @author huangchao
 */
public class ByteSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {byte.class, Byte.class};

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
                    return new Byte(json.getTokenText());
                }
                else if (json.isBooleanTrue())
                {
                    return new Byte("1");
                }
                else if (json.isBooleanFalse())
                {
                    return new Byte("0");
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("203");  // can not convert JSON string to byte object
    }
}
