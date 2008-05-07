package leaflife.widget.jsrpc.serializer;

import java.io.EOFException;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;


/**
 * Serializer for converting from and to Long object and JSON string.
 * @author huangchao
 */
public class LongSerializer extends AbstractSerializer
{
    private Class[] serializable_classes = new Class[] {long.class, Long.class};

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
                    return new Long(json.getTokenText());
                }
                else if (json.isBooleanTrue())
                {
                    return new Long(1);
                }
                else if (json.isBooleanFalse())
                {
                    return new Long(0);
                }
            }
        }
        catch (EOFException e)
        {
        }
        catch (NumberFormatException e)
        {
        }
        throw new UnmarshallException("211");  // can not convert JSON string to long object
    }
}
